{
    'name': 'Website Local Services',
    'version': '1.0',
    'summary': 'Local services management system',
    'category': 'Tools',
    'author': 'Mohammed Shekha',
    'depends': ['base', 'web', 'website'],
    'data': [
        'security/ir.model.access.csv',
        'views/service_views.xml',
        'views/service_templates.xml',
    ],
    'demo': [
        'data/local_services_demo.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'website_local_services/static/src/**/*',
        ],
    },
    'installable': True,
    'application': True,
}
