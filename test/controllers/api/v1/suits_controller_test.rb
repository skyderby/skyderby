require 'test_helper'

class Api::V1::SuitsControllerTest < ActionDispatch::IntegrationTest
  test '#index - returns correct fields' do
    get api_v1_suits_url

    fields = response.parsed_body.map(&:keys).flatten.uniq.sort

    assert_equal %w[category id makeCode make name].sort, fields
  end
end
