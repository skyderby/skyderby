require 'test_helper'

class Manage::AccountsControllerTest < ActionDispatch::IntegrationTest
  test 'guest user #index not allowed' do
    get accounts_path
    assert_response :forbidden
  end

  test 'guest user #show not allowed' do
    get account_path(id: users(:event_responsible).id)
    assert_response :forbidden
  end

  test 'admin user #index' do
    sign_in users(:admin)
    get accounts_path
    assert_response :success
  end

  test 'admin user #show' do
    sign_in users(:admin)
    get account_path(id: users(:admin).id)
    assert_response :success
  end
end
