require 'test_helper'

class ColorThemeTest < ActionDispatch::IntegrationTest
  test 'follows the system theme without a cookie' do
    get root_path

    assert_select 'html:not([data-theme])'
    assert_select '[data-controller="theme"] [data-theme-choice-param="system"][aria-pressed="true"]'
  end

  test 'renders the theme stored in the cookie' do
    cookies[:theme] = 'dark'
    get root_path

    assert_select 'html[data-theme="dark"]'
    assert_select '[data-theme-choice-param="dark"][aria-pressed="true"]'
  end

  test 'ignores unknown cookie values' do
    cookies[:theme] = 'sepia'
    get root_path

    assert_select 'html:not([data-theme])'
  end
end
