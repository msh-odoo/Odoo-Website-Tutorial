from odoo import _, api, fields, models


class EventTrack(models.Model):
    _inherit = "event.track"

    @api.model
    def _get_website_domain(self):
        return [
            ("website_published", "=", True),
        ]

    @api.model
    def website_search(self, search=None, tag=None, speaker=None):
        domain = self._get_website_domain()

        if search:
            domain += [
                "|",
                ("name", "ilike", search),
                ("description", "ilike", search),
            ]

        if tag:
            domain.append(("tag_ids", "in", tag.ids))

        if speaker:
            domain.append(("speaker_ids", "in", speaker.ids))

        return domain

    def _get_related_tracks(self, limit=4):
        self.ensure_one()

        domain = [
            ("id", "!=", self.id),
            ("event_id", "=", self.event_id.id),
            ("website_published", "=", True),
        ]

        if self.tag_ids:
            domain.append(("tag_ids", "in", self.tag_ids.ids))

        return self.search(domain, limit=limit)
