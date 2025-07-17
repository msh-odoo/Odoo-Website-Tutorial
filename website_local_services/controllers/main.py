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
