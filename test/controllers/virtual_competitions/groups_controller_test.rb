require 'test_helper'

class VirtualCompetitions::GroupsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @group = virtual_competition_groups(:cumulative)
    @distance = virtual_competitions(:skydive_distance_wingsuit)
    @speed = virtual_competitions(:skydive_speed_wingsuit)
    @time = VirtualCompetition.create!(
      name: 'Wingsuit time',
      group: @group,
      suits_kind: :wingsuit,
      jumps_kind: :skydive,
      discipline: :time,
      period_from: Date.new(2015, 1, 1),
      period_to: Date.new(2025, 1, 1)
    )
  end

  test 'regular user #index' do
    get virtual_competition_groups_path
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
    get edit_virtual_competition_group_path(id: @group.id)
    assert_response :forbidden
  end

  test 'regular user #update' do
    patch virtual_competition_group_path(id: @group.id), params: { virtual_comp_group: { name: 'New name' } }
    assert_response :forbidden
  end

  test 'regular user #destroy' do
    delete virtual_competition_group_path(id: @group.id)
    assert_response :forbidden
  end

  test 'combined scoreboard is public' do
    score(profiles(:john), distance: 3000, speed: 300, time: 90)

    get virtual_competition_group_path(@group)

    assert_response :success
    assert_select 'table.vc-group-scoreboard-table'
    assert_select 'tbody#group-category-wingsuit tr.scoreboard-competitor', 1
  end

  test 'renders a blank slate when no suit class has all three disciplines' do
    get virtual_competition_group_path(virtual_competition_groups(:main))

    assert_response :success
    assert_select '.vc-group-scoreboard__blank'
  end

  test 'loads a further page of a category' do
    26.times do |index|
      score(Profile.create!(name: "Pilot #{index}"), distance: 3000 - index, speed: 300, time: 90)
    end

    get virtual_competition_group_path(@group)

    assert_select 'tbody#group-category-wingsuit tr.scoreboard-competitor', 25
    assert_select 'tbody#group-category-wingsuit-more a'

    get virtual_competition_group_category_path(@group, 'wingsuit', page: 2),
        headers: { 'Accept' => 'text/vnd.turbo-stream.html' }

    assert_response :success
    assert_match 'action="append" target="group-category-wingsuit"', response.body
  end

  test 'load more falls back to a full page when turbo is unavailable' do
    26.times do |index|
      score(Profile.create!(name: "Pilot #{index}"), distance: 3000 - index, speed: 300, time: 90)
    end

    get virtual_competition_group_category_path(@group, 'wingsuit', page: 2)

    assert_redirected_to virtual_competition_group_path(
      @group, pages: { 'wingsuit' => 2 }, anchor: 'group-category-wingsuit'
    )

    follow_redirect!
    assert_select 'tbody#group-category-wingsuit tr.scoreboard-competitor', 26
  end

  test 'ignores non-scalar pagination params instead of erroring' do
    score(profiles(:john), distance: 3000, speed: 300, time: 90)

    get virtual_competition_group_path(@group, pages: { 'wingsuit' => { 'foo' => '1' } })
    assert_response :success

    get virtual_competition_group_category_path(@group, 'wingsuit', page: ['2'])
    assert_response :redirect
  end

  test 'hides categories with no qualifying pilots' do
    get virtual_competition_group_path(@group, gender: 'female')

    assert_response :success
    assert_select 'tbody#group-category-wingsuit', false
    assert_select '.vc-group-scoreboard__blank'
  end

  private

  def score(profile, results)
    results.each do |discipline, result|
      track = Track.create!(
        pilot: profile,
        kind: :skydive,
        visibility: :public_track,
        suit: suits(:apache),
        recorded_at: Date.new(2024, 6, 1)
      )

      instance_variable_get(:"@#{discipline}").results.create!(track:, result:, wind_cancelled: false)
    end
  end
end
