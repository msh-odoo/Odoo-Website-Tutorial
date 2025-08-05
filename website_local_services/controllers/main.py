import json
from werkzeug.exceptions import NotFound

from odoo import http
from odoo.http import request

class LocalServices(http.Controller):

    @http.route(['/services'], type='http', auth='public', website=True)
    def services(self, **kwargs):
        """
        Renders the services page.
        """
        domain = []
        services = request.env['service.service'].sudo().search(domain)

        return request.render('website_local_services.services', {
            'services': services,
            'opt_service_tags': request.env['ir.config_parameter'].sudo().get_param('website_local_services.enable_service_tags') and 'show' or 'hide',
        })

    @http.route(['/website_local_services/config_service_tags'], type='jsonrpc', auth='user')
    def config_service_tags(self, **kwargs):
        enableServiceTags = kwargs.get("enable_service_tags")
        if enableServiceTags == 'show':
            enableServiceTags = True
        else:
            enableServiceTags = False
        return request.env['ir.config_parameter'].set_param('website_local_services.enable_service_tags', enableServiceTags)

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

    @http.route(['/website_local_services/book_appointment'], type='jsonrpc', auth="user")
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

    @http.route(['/service/<model("service.service"):service>/add_provider'], type='http', auth="user", website=True)
    def add_provider(self, service):
        return request.render('website_local_services.add_provider', {
            'service': service,
        })

    @http.route(['/service/<model("service.service"):service>/submit_provider'], type='http', auth="user", method=['POST'], website=True)
    def submit_provider(self, service, **kwargs):
        name = kwargs.get('name')
        phone = kwargs.get('phone')
        email = kwargs.get('email')
        profile_description = kwargs.get('profile_description')
        if not service.exists():
            return request.redirect('/services')
        provider = request.env['service.provider'].sudo().create({
            'name': name,
            'service_id': service.id,
            'phone': phone,
            'email': email,
            'profile_description': profile_description,
        })
        return request.redirect('/service/%s' % service.id)

    @http.route(['/service/<model("service.service"):service>'], type='http', auth="user", website=True)
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
