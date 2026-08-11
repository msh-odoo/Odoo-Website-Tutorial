import { registry } from "@web/core/registry";
import { Interaction } from "@web/public/interaction";
import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";

export class OxpTrackListInteraction extends Interaction {
    // 1. SELECTOR — one interaction instance is created for every matching snippet.
    static selector = ".s_oxp_track_list";

    // 6. DYNAMIC SELECTOR — a named selector reused in dynamicContent.
    dynamicSelectors = {
        ...this.dynamicSelectors,
        _searchInput: () => this.searchInputEl,
        _searchForm: () => this.searchFormEl,
    };

    // 4. DYNAMIC CONTENT — declarative DOM updates and event listeners.
    dynamicContent = {
        // 4.1 t-out
        ".s_oxp_track_list_search_title": {
            "t-out": () => this.searchText ? `for “${this.searchText}”` : "",
            "t-att-class": () => ({
                "text-primary": !!this.searchText,
            }),
        },
        // 4.2 t-att-class
        ".s_oxp_track_list_heading": {
            "t-att-class": () => ({
                "text-primary": !!this.searchText,
            }),
        },
        // The dynamic selector above is used for this event listener.
        ".s_oxp_track_list_search_form": {
            "t-on-submit.prevent": this.onSearchSubmit,
        },
        // 4.3 t-on-click
        ".o_wetrack_wishlist": {
            "t-on-click.prevent": this.onClickWishlist,
        },
        /*
         * 4.4 Optional t-component example:
         * ".some_selector": {
         *     "t-component": () => [MyComponent, { tracks: this.tracks }],
         * },
         * This snippet does not need an OWL component, so it is not enabled.
         */
    };

    // 2. LIFECYCLE — setup: synchronous initialization.
    // 3. this.el is this snippet's root DOM element; this.env exposes services.
    setup() {
        this.listEl = this.el.querySelector(".s_oxp_track_list_items");
        this.searchInputEl = this.el.querySelector(".s_oxp_track_list_search");
        this.searchFormEl = this.el.querySelector(".s_oxp_track_list_search_form");
        // 3. SERVICE — obtain a service from the environment.
        this.notification = this.env.services.notification;
        this.searchText = "";
    }

    // 2. LIFECYCLE — willStart: load data before the interaction starts.
    async willStart() {
        this.tracks = await this.fetchTracks();
    }

    // 2. LIFECYCLE — start: render after dynamic content and listeners are ready.
    start() {
        this.renderTracks();
    }

    async onSearchSubmit() {
        this.searchText = this.searchInputEl.value.trim();
        this.tracks = await this.fetchTracks();
        this.protectSyncAfterAsync(() => this.renderTracks())();
    }


    fetchTracks() {
        // 5. waitFor protects the interaction while the RPC is pending.
        return this.waitFor(rpc("/oxp/tracks/snippet", {
            search: this.searchText,
            limit: Number(this.el.dataset.limit) || 6,
        }));
    }

    async onClickWishlist(ev) {
        const button = ev.currentTarget;
        button.disabled = true;
        try {
            const result = await this.waitFor(rpc("/oxp/tracks/wishlist", {
                track_id: Number(button.dataset.trackId),
                set_reminder_on: !button.classList.contains("btn-danger"),
            }));
            this.protectSyncAfterAsync(() => {
                this.updateWishlistButton(button, result.reminderOn);
            })();
            this.notification.add(
                result.reminderOn ? _t("Added to wishlist") : _t("Removed from wishlist"),
                { type: "success" }
            );
        } catch {
            if (!this.isDestroyed) {
                this.notification.add(_t("Something went wrong."), { type: "danger" });
            }
        } finally {
            if (!this.isDestroyed) {
                button.disabled = false;
            }
        }
    }

    updateWishlistButton(button, reminderOn) {
        button.classList.toggle("btn-danger", reminderOn);
        button.classList.toggle("btn-outline-danger", !reminderOn);
        button.querySelector("i").classList.toggle("fa-solid", reminderOn);
        button.querySelector("i").classList.toggle("fa-regular", !reminderOn);
    }

    renderTracks() {
        // This helper restores the original snippet preview when the interaction is destroyed.
        this.removeChildren(this.listEl);
        this.renderAt("website_event_track_oxp.s_oxp_track_list_cards", { tracks: this.tracks }, this.listEl);
        this.updateContent();
    }

    // 2. LIFECYCLE — destroy: release state when the interaction is stopped.
    destroy() {
        this.tracks = [];
        this.listEl = null;
        this.searchInputEl = null;
        this.notification = null;
    }
}

registry
    .category("public.interactions")
    .add("website_event_track_oxp.oxp_track_list", OxpTrackListInteraction);
