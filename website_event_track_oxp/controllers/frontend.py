# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request


class WebsiteEventTrackOxpFrontend(http.Controller):

    @http.route(
        "/oxp/tracks/snippet",
        type="jsonrpc",
        auth="public",
        website=True,
        readonly=True,
    )
    def track_list_snippet(self, search=None, limit=6):
        """Return OXP tracks for the dynamic website snippet."""
        try:
            limit = min(max(int(limit), 1), 16)
        except (TypeError, ValueError):
            limit = 6

        tracks = request.env["event.track"].sudo()
        domain = tracks.website_search(search=search)
        oxp_event = request.env.ref(
            "website_event_track_oxp.event_oxp_2026", raise_if_not_found=False
        )
        if not oxp_event:
            return []
        domain.append(("event_id", "=", oxp_event.id))

        return [
            {
                "id": track.id,
                "name": track.name,
                "url": f"/oxp/tracks/{track.id}",
                "isReminderOn": track.is_reminder_on,
                "tags": [{"id": tag.id, "name": tag.name} for tag in track.tag_ids],
            }
            for track in tracks.search(domain, order="date asc, name", limit=limit)
        ]
