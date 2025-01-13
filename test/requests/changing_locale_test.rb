require 'test_helper'

class ChangingLocaleTest < ActionDispatch::IntegrationTest
  test 'should handle missing locale gracefully' do
    get root_path(locale: "en'A=0")
    assert_predicate response, :successful?
  end
end
