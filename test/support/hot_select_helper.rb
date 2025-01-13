module HotSelectHelper
  def hot_select(value, from:)
    find("div[id='hot-select-#{from}-container'] .hot-select-placeholder").click
    assert_selector '.hot-select-options'
    find('.hot-select-option', text: value).click
  end
end
