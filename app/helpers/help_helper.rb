module HelpHelper
  def markdown(text)
    unless @markdown_renderer

      # see https://github.com/vmg/redcarpet#darling-i-packed-you-a-couple-renderers-for-lunch
      renderer = Redcarpet::Render::HTML.new
      #(self, user_color_scheme_class, {
        # Handled further down the line by Gitlab::Markdown::SanitizationFilter
      #  escape_html: false
      #}.merge(options))

      # see https://github.com/vmg/redcarpet#and-its-like-really-simple-to-use
      @markdown_renderer = Redcarpet::Markdown.new(renderer,
        no_intra_emphasis:   true,
        tables:              true,
        fenced_code_blocks:  true,
        strikethrough:       true,
        lax_spacing:         true,
        space_after_headers: true,
        superscript:         true,
        footnotes:           true
      )
    end

    @markdown_renderer.render(text).html_safe
  end
end
