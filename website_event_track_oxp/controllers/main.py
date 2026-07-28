# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.portal.controllers.portal import pager as portal_pager


class WebsiteEventTrackController(http.Controller):
    """Controllers used during OXP demonstrations."""

    # ---------------------------------------------------------
    # Track List
    # ---------------------------------------------------------

    @http.route(
        [
            "/oxp/tracks",
            "/oxp/tracks/page/<int:page>",
        ],
        type="http",
        auth="public",
        website=True,
        sitemap=True,
        readonly=True,
    )
    def track_list(
        self,
        page=1,
        search=None,
        tag=None,
        speaker=None,
        sort="name",
        **kwargs,
    ):
        Track = request.env["event.track"].sudo()

        domain = Track.website_search(
            search=search,
        )

        if tag:
            domain.append(("tag_ids", "=", int(tag)))

        if speaker:
            domain.append(("speaker_ids", "=", int(speaker)))

        order = {
            "name": "name",
            "date": "date asc",
        }.get(sort, "name")

        total = Track.search_count(domain)

        pager = portal_pager(
            url="/oxp/tracks",
            page=page,
            total=total,
            step=12,
            url_args={
                "search": search,
                "tag": tag,
                "speaker": speaker,
                "sort": sort,
            },
        )

        tracks = Track.search(
            domain,
            order=order,
            limit=12,
            offset=pager["offset"],
        )

        values = {
            "tracks": tracks,
            "pager": pager,
            "search": search,
            "sort": sort,
            "current_tag": tag,
            "current_speaker": speaker,
            "tags": request.env["event.track.tag"].sudo().search([]),
            "speakers": request.env["event.track.speaker"].sudo().search([]),
        }

        return request.render(
            "website_event_track_oxp.track_list",
            values,
        )

    # ---------------------------------------------------------
    # Track Detail
    # ---------------------------------------------------------

    @http.route(
        "/oxp/tracks/<model('event.track'):track>",
        type="http",
        auth="public",
        website=True,
        sitemap=True,
        readonly=True,
    )
    def track_detail(self, track, **kwargs):
        if not track.website_published:
            return request.not_found()

        values = {
            "track": track,
            "related_tracks": track._get_related_tracks(),
            "main_object": track,
        }

        return request.render(
            "website_event_track_oxp.track_detail",
            values,
        )

    # ---------------------------------------------------------
    # Wishlist
    # ---------------------------------------------------------

    @http.route(
        "/oxp/tracks/wishlist",
        type="jsonrpc",
        auth="user",
    )
    def wishlist(self, track_id):
        """
        Toggle wishlist for the current user.

        NOTE:
        The actual implementation will call the helper
        method provided by the wishlist model/service.
        """

        track = request.env["event.track"].browse(track_id)

        added = track.action_toggle_wishlist()

        return {
            "success": True,
            "wishlist": added,
        }

    # ---------------------------------------------------------
    # Related Talks
    # ---------------------------------------------------------

    @http.route(
        "/oxp/tracks/related",
        type="jsonrpc",
        auth="public",
    )
    def related_tracks(self, track_id):

        track = request.env["event.track"].sudo().browse(track_id)

        return [
            {
                "id": related.id,
                "name": related.name,
                "url": related.website_url,
            }
            for related in track._get_related_tracks()
        ]

    # ---------------------------------------------------------
    # Search Suggestions
    # ---------------------------------------------------------

    @http.route(
        "/oxp/tracks/search",
        type="jsonrpc",
        auth="public",
    )
    def search_suggestions(self, term):

        Track = request.env["event.track"].sudo()

        tracks = Track.search(
            [
                ("website_published", "=", True),
                ("name", "ilike", term),
            ],
            limit=5,
        )

        return [
            {
                "id": track.id,
                "name": track.name,
                "url": track.website_url,
            }
            for track in tracks
        ]
