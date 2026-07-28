/** @odoo-module **/

import { Interaction } from "@web/public/interaction";
import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";

export class TrackWishlistInteraction extends Interaction {

    static selector = ".o_wetrack_wishlist";

    dynamicContent = {
        ".o_wetrack_wishlist": {
            "t-on-click": this.onClickWishlist,
        },
    };

    /**
     * Toggle wishlist
     */
    async onClickWishlist(ev) {
        ev.preventDefault();

        const button = ev.currentTarget;
        const trackId = Number(button.dataset.trackId);

        button.disabled = true;

        try {
            const result = await rpc("/oxp/tracks/wishlist", {
                track_id: trackId,
            });

            this.updateButton(button, result.wishlist);

            this.services.notification.add(
                result.wishlist
                    ? _t("Added to wishlist")
                    : _t("Removed from wishlist"),
                {
                    type: "success",
                }
            );
        } catch {
            this.services.notification.add(
                _t("Something went wrong."),
                {
                    type: "danger",
                }
            );
        } finally {
            button.disabled = false;
        }
    }

    /**
     * Update UI
     */
    updateButton(button, inWishlist) {
        button.classList.toggle("btn-danger", inWishlist);
        button.classList.toggle("btn-outline-danger", !inWishlist);

        const icon = button.querySelector("i");

        if (icon) {
            icon.classList.toggle("fa-solid", inWishlist);
            icon.classList.toggle("fa-regular", !inWishlist);
        }
    }

}

TrackWishlistInteraction.register();
