require 'test_helper'

class VirtualCompetitions::GroupsControllerTest < ActionDispatch::IntegrationTest
  test 'regular user #index' do
    get virtual_competition_groups_path
    assert_response :forbidden
  end

  test 'regular user #show redirects to overall' do
    group = virtual_competition_groups(:main)
    get virtual_competition_group_path(id: group.id)
    assert_response :forbidden
  end

  test 'regular user #new' do
    get new_virtual_competition_group_path
    assert_response :forbidden
  end

  test 'regular user #create' do
    post virtual_competition_groups_path, params: { virtual_comp_group: { name: 'New group' } }
    assert_response :forbidden
  end

  test 'regular user #edit' do
    group = virtual_competition_groups(:main)
    get edit_virtual_competition_group_path(id: group.id)
    assert_response :forbidden
  end

  test 'regular user #update' do
    group = virtual_competition_groups(:main)
    patch virtual_competition_group_path(id: group.id), params: { virtual_comp_group: { name: 'New name' } }
    assert_response :forbidden
  end

  test 'regular user #destroy' do
    group = virtual_competition_groups(:main)
    delete virtual_competition_group_path(id: group.id)
    assert_response :forbidden
  end
end
