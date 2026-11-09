import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Post/page HTML is sanitised on save so an author account can't inject
 * scripts into the public site. YouTube/Vimeo/Pinterest embeds are allowed.
 */
export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
      "blockquote", "hr", "img", "figure", "figcaption", "iframe", "div", "span", "table",
      "thead", "tbody", "tr", "th", "td", "code", "pre", "mark",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title", "loading"],
      div: ["data-youtube-video", "class"],
      span: ["class"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      "*": ["id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: [
      "www.youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
      "assets.pinterest.com",
    ],
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: attribs.rel?.includes("sponsored") ? "sponsored noopener nofollow" : "noopener" }
            : attribs,
        };
      },
      iframe: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
    },
  });
}
