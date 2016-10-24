class WillPaginateLoadMoreRenderer < WillPaginate::ActionView::LinkRenderer
  
  protected

  def next_page
    previous_or_next_page(
      @collection.next_page,
      I18n.t('will_paginate.load_more', default: "Load more..."),
      'btn btn-default'
    ) if @collection.next_page
  end

  def pagination
    [:next_page]
  end

  def tag(name, value, attributes = {})
    attributes.merge!('data-remote': true)
    super(name, value, attributes)
  end
end
