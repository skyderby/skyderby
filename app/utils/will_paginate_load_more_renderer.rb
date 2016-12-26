class WillPaginateLoadMoreRenderer < WillPaginate::ActionView::LinkRenderer
  protected

  def next_page
    return unless @collection.next_page
    previous_or_next_page(
      @collection.next_page,
      I18n.t('will_paginate.load_more', default: 'Load more...'),
      'btn btn-default'
    )
  end

  def pagination
    [:next_page]
  end

  def tag(name, value, attributes = {})
    attributes[:'data-remote'] = true
    attributes[:'data-params'] = 'append=true'

    super(name, value, attributes)
  end
end
