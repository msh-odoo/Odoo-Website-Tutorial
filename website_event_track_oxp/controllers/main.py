# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.portal.controllers.portal import pager as portal_pager
from odoo.addons.website_event_track.controllers.event_track import EventTrackController
class WebsiteEventTrackOxpController(http.Controller):
    """Controllers used during OXP demonstrations."""

    # ---------------------------------------------------------
    # Track List
    # ---------------------------------------------------------

    @http.route(
        [
            "/oxp/tracks",
            "/oxp/tracks/page/<int:page>",
        ], type="http", auth="public", website=True, sitemap=True, readonly=True,)
    def track_list(self, page=1, search=None, tag=None, speaker=None, sort="name", **kwargs):
        Track = request.env["event.track"].sudo()

        domain = Track.website_search(
            search=search,
        )

        # Temporary we show only OXP tracks here
        oxp_event = self.env.ref("website_event_track_oxp.event_oxp_2026", raise_if_not_found=False)
        if oxp_event:
            domain.append(('event_id', '=', oxp_event.id))

        if tag:
            domain.append(("tag_ids", "=", int(tag)))

        if speaker:
            domain.append(("partner_id", "=", int(speaker)))

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
        speakers = tracks.mapped('partner_id')
        tags = request.env["event.track.tag"].sudo().search([])

        values = {
            "tracks": tracks,
            "pager": pager,
            "search": search,
            "sort": sort,
            "current_tag": tag,
            "current_speaker": speaker,
            "tags": tags,
            "speakers": speakers,
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
        type="http", auth="public", website=True, sitemap=True, readonly=True)
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

    @http.route(
        "/oxp/tracks/<model('event.track'):track>/feedback",
        type="http", auth="user", website=True, methods=["GET", "POST"]
    )
    def submit_feedback(self, track, **post):
        """Submit talk feedback.

        This route intentionally does not create any record because this
        module demonstrates HTTP Controllers rather than ORM models.
        """

        if request.httprequest.method != 'POST':
            return request.render(
                "website_event_track_oxp.track_feedback",
                {
                    'track': track,
                },
            )

        name = (post.get("name") or "").strip()
        email = (post.get("email") or "").strip()
        comment = (post.get("comment") or "").strip()

        # ------------------------------------------------------------------
        # Validation example
        # ------------------------------------------------------------------

        if not name and not email:
            return request.redirect(
                f"/oxp/tracks/{track.id}?feedback_error=name"
            )

        # ------------------------------------------------------------------
        # Normally you would save the feedback here.
        #
        # request.env["event.track.feedback"].create({...})
        #
        # We intentionally skip this because the purpose of this module is to
        # demonstrate Controllers and QWeb.
        # ------------------------------------------------------------------

        _feedback = {
            "track_id": track.id,
            "name": name,
            "email": email,
            "comment": comment,
        }

        self.env["event.track.feedback"].sudo().create(_feedback)

        return request.redirect(
            f"/oxp/tracks/{track.id}/feedback?feedback=success"
        )

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

class WebsiteEventTrackController(EventTrackController):

    # ---------------------------------------------------------
    # Wishlist
    # ---------------------------------------------------------

    @http.route(
        "/oxp/tracks/wishlist",
        type="jsonrpc",
        auth="user",
    )
    def track_reminder_toggle(self, track_id, set_reminder_on):
        """
        Toggle wishlist for the current user.

        NOTE:
        The actual implementation will call the helper
        method provided by the wishlist model/service.
        """

        track = self._fetch_track(track_id, allow_sudo=True)
        force_create = set_reminder_on or track.wishlisted_by_default
        event_track_partner = track._get_event_track_visitors(force_create=force_create)

        if not track.wishlisted_by_default:
            if not event_track_partner or event_track_partner.is_wishlisted == set_reminder_on:  # ignore if new state = old state
                return {'error': 'ignored'}
            event_track_partner.is_wishlisted = set_reminder_on
        else:
            if not event_track_partner or event_track_partner.is_blacklisted != set_reminder_on:  # ignore if new state = old state
                return {'error': 'ignored'}
            event_track_partner.is_blacklisted = not set_reminder_on

        result = {'reminderOn': set_reminder_on}

        return result
