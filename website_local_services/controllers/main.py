from odoo import http
from odoo.http import request

class LocalServices(http.Controller):

    @http.route(['/services'], type='http', auth='public', website=True)
    def services(self, **kwargs):
        """
        Renders the services page.
        """
        # domain = [('is_published', '=', True)]
        domain = []
        services = request.env['service.service'].sudo().search(domain)

        return request.render('website_local_services.services', {
            'services': services,
        })

    @http.route(['/service/search'], type='http', auth="public", website=True)
    def search_services(self, **kwargs):
        """
        Handles the search functionality for services.
        """
        search_query = kwargs.get('search', '').strip()
        if not search_query:
            return request.redirect('/services')

        # Search for services matching the query
        domain = [('name', 'ilike', search_query)]
        services = request.env['service.service'].sudo().search(domain)

        return request.render('website_local_services.services', {
            'services': services,
            'search': search_query,
        })

    @http.route(['/website_local_services/book_appointment'], type='jsonrpc', auth="public")
    def book_appointment(self, **kwargs):
        """
        Handles the booking of an appointment with a service provider.
        """
        provider_id = kwargs.get('provider_id')
        appointment_date = kwargs.get('appointment_date')

        if not provider_id or not appointment_date:
            return {'error': 'Missing provider ID or appointment date.'}

        provider = request.env['service.provider'].sudo().browse(provider_id)
        if not provider.exists():
            return {'error': 'Provider not found.'}

        # Update the provider's appointment date
        provider.appointment_date = appointment_date

        return {'success': True, 'message': 'Appointment booked successfully.'}

    @http.route(['/service/<model("service.service"):service>'], type='http', auth="public", website=True)
    def service_providers(self, service):
        return request.render('website_local_services.service_providers', {
            'service': service,
            'providers': service.provider_ids,
        })

    @http.route(['/service/provider/<model("service.provider"):provider>'], type='http', auth="public", website=True)
    def provider_detail(self, provider):
        return request.render('website_local_services.service_provider_detail', {
            'provider': provider,
        })
