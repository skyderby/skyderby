require 'test_helper'

class LocaleRedirectsRoutingTest < ActionDispatch::IntegrationTest
  test 'to #index locale: ru' do
    I18n.with_locale(:en) { get('/ru') }
    assert_redirected_to root_path
  end

  test 'to #index locale: en' do
    I18n.with_locale(:en) { get('/en') }
    assert_redirected_to root_path
  end

  test 'to places#index locale: ru' do
    I18n.with_locale { get('/ru/places') }
    assert_redirected_to places_path
  end

  test 'to places#index locale: en' do
    I18n.with_locale { get('/en/places') }
    assert_redirected_to places_path
  end
end
