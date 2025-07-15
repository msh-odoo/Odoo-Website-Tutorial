from odoo import models, fields


class Service(models.Model):
    _name = 'service.service'
    _description = 'Service Providers'
    _inherit = [
        'website.published.multi.mixin',
        'website.cover_properties.mixin',
        'website.searchable.mixin',
    ]

    name = fields.Char(string='Service Name', required=True)
    description = fields.Text(string='Description')
    provider_ids = fields.One2many('service.provider', 'service_id', string='Service Providers')
    tag_ids = fields.Many2many('service.tag', string='Tags')

class ServiceProvider(models.Model):
    _name = 'service.provider'
    _description = 'Service Provider'
    _inherit = [
        'website.cover_properties.mixin',
        'website.searchable.mixin',
    ]

    name = fields.Char(string='Name', required=True)
    service_id = fields.Many2one('service.service', string='Service', required=True)
    phone = fields.Char()
    email = fields.Char()
    profile_description = fields.Html(string='Service Provider Profile')
