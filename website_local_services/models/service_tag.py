from odoo import models, fields

class ServiceTag(models.Model):
    _name = 'service.tag'
    _description = 'Service Tags'

    name = fields.Char(string='Tag Name', required=True)
    color = fields.Integer(string='Color Index')
