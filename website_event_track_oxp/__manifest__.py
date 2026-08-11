{
    "name": "Website Event Track OXP",
    "summary": "OXP demo module showcasing Website Controllers and Interactions",
    "description": """
Website Event Track OXP
=======================

This module extends website_event_track and demonstrates:

* Website HTTP Controllers
* JSON-RPC Controllers
* QWeb Rendering
* Website Menu
* Search
* Pager
* Model Converters
* Website Layout
* Portal Integration
* CSRF
* Readonly Routes
* Sitemap
* Website Interactions

This module is intended for Odoo Experience demonstrations.
""",
    "version": "1.0",
    "category": "Website/Event",
    "license": "LGPL-3",
    "author": "Mohammad Shekha",
    "website": "https://www.odoo.com",
    "depends": [
        "website_event_track",
        "portal",
    ],
    "data": [
        "security/ir.access.csv",
        "data/website_event_track_oxp_data.xml",
        "views/snippets/snippets.xml",
        "views/snippets/s_event_track_list.xml",
        "views/event_track_oxp_templates.xml",
        "views/event_track_oxp_portal_templates.xml",
    ],
    "assets": {
        "web.assets_frontend": [
            # "website_event_track_oxp/static/src/scss/event_track.scss",
            "website_event_track_oxp/static/src/interactions/*.js",
            ("remove", "website_event_track_oxp/static/src/interactions/*.edit.js"),
            "website_event_track_oxp/static/src/interactions/*.xml",
        ],
        "website.assets_inside_builder_iframe": [
            "website_event_track_oxp/static/src/interactions/*.edit.js",
        ],
    },
    "demo": [
        "demo/event_track_demo.xml",
    ],
    "application": False,
    "installable": True,
}
