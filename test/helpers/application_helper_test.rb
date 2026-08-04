require 'test_helper'

class ApplicationHelperTest < ActionView::TestCase
  test 'page_title keeps quotes in the title readable' do
    assert_equal %(Wingsuit "Pro" Cup - Skyderby), page_title(ERB::Util.html_escape('Wingsuit "Pro" Cup'))
  end

  test 'page_title falls back to the base title' do
    assert_equal "Skyderby: #{I18n.t('static_pages.index.title')}", page_title(nil)
  end
end
