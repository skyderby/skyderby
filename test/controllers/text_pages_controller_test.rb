require 'test_helper'

class TextPagesControllerTest < ActionDispatch::IntegrationTest
  test 'support, privacy and terms are public' do
    [support_path, privacy_path, terms_path].each do |path|
      get path

      assert_response :success
      assert_select 'article.text-page h1'
    end
  end

  test 'pages follow the selected language' do
    get privacy_path, headers: { 'Accept-Language' => 'ru' }

    assert_select 'h1', 'Конфиденциальность'
  end
end
