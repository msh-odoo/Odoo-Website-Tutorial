from odoo import http
from odoo.http import request

class LocalServices(http.Controller):

    @http.route(['/services'], type='http', auth='public')
    def services(self, **kwargs):
        """
        Renders the services page
        """
        domain = [('is_published', '=', True)]
        services = request.env['service.service'].sudo().search(domain)

        return request.render('website_local_services.services', {
            'services': services,
        })

    @http.route(['/service/<model("service.service"):service>'], type='http', auth="public", website=True)
    def provider_detail(self, service):
        return request.render('website_local_services.service_providers', {
            'service': service
        })

    @http.route(['/service/<model("service.provider"):provider>'], type='http', auth="public", website=True)
    def provider_detail(self, provider):
        return request.render('website_local_services.service_provider_detail', {
            'provider': provider
        })