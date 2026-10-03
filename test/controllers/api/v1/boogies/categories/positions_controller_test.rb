require 'test_helper'

class Api::V1::Boogies::Categories::PositionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  setup do
    @boogie = Boogie.find(ActiveRecord::FixtureSet.identify(:boogie))
    @first = Boogie::Category.find(ActiveRecord::FixtureSet.identify(:boogie_open))
    @second = @boogie.categories.create!(name: 'Advanced')
  end

  test '#update moves a category up' do
    patch api_v1_boogie_category_position_path(@boogie, @second), params: { direction: 'up' },
                                                                  headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_operator @second.reload.order, :<, @first.reload.order
  end

  test '#update moves a category down' do
    patch api_v1_boogie_category_position_path(@boogie, @first), params: { direction: 'down' },
                                                                 headers: bearer(:event_responsible_write), as: :json

    assert_response :success
    assert_operator @first.reload.order, :>, @second.reload.order
  end

  test '#update rejects an unknown direction' do
    patch api_v1_boogie_category_position_path(@boogie, @first), params: { direction: 'left' },
                                                                 headers: bearer(:event_responsible_write), as: :json

    assert_response :unprocessable_content
  end

  test '#update is forbidden for non editors' do
    patch api_v1_boogie_category_position_path(@boogie, @second), params: { direction: 'up' },
                                                                  headers: bearer(:regular_user_write), as: :json

    assert_response :forbidden
  end
end
