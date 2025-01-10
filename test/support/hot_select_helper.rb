module HotSelectHelper
  def hot_select(value, from:)
    find("div[id='hot-select-#{from}-container'] .hot-select-placeholder").click
    expect(page).to have_css('.hot-select-options')
    find('.hot-select-option', text: value).click
  end
end
