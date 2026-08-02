# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request

from odoo.addons.portal.controllers.portal import CustomerPortal
from odoo.addons.portal.controllers.portal import pager as portal_pager


class WebsiteEventTrackPortal(CustomerPortal):

    # ---------------------------------------------------------
    # Portal Home Counter
    # ---------------------------------------------------------

    def _prepare_home_portal_values(self, counters):
        values = super()._prepare_home_portal_values(counters)

        if "track_count" in counters:
            values["track_count"] = request.env["event.track"].search_count([
                ("website_published", "=", True),
            ])

        return values

    # ---------------------------------------------------------
    # My Talks
    # ---------------------------------------------------------

    @http.route(
        ["/my/tracks", "/my/tracks/page/<int:page>"],
        type="http", auth="user", website=True)
    def portal_my_tracks(self, page=1, search=None, sortby="name", **kw):
        Track = request.env["event.track"]
        domain = [
            ("partner_id", "=", request.env.user.partner_id.id),
            ("website_published", "=", True),
        ]
        if search:
            domain += ["|", ("name", "ilike", search), ("description", "ilike", search)]

        sortings = {
            "name": {
                "label": "Name",
                "order": "name",
            },
            "date": {
                "label": "Date",
                "order": "date asc",
            },
        }

        order = sortings[sortby]["order"]
        track_count = Track.search_count(domain)

        pager = portal_pager(
            url="/my/tracks",
            total=track_count,
            page=page,
            step=20,
            url_args={
                "search": search,
                "sortby": sortby,
            },
        )

        tracks = Track.search(
            domain,
            order=order,
            limit=20,
            offset=pager["offset"],
        )

        values = self._prepare_portal_layout_values()
        values.update({
            "tracks": tracks,
            "page_name": "track",
            "pager": pager,
            "search": search,
            "sortby": sortby,
            "sortings": sortings,
        })

        return request.render(
            "website_event_track_oxp.portal_my_tracks",
            values,
        )

    # ---------------------------------------------------------
    # Track Detail
    # ---------------------------------------------------------

    @http.route(
        "/my/tracks/<model('event.track'):track>",
        type="http", auth="user", website=True)
    def portal_track_detail(self, track, **kw):
        values = self._prepare_portal_layout_values()

        values.update({
            "page_name": "track",
            "track": track,
        })

        return request.render(
            "website_event_track_oxp.portal_track_detail",
            values,
        )
