require 'test_helper'

class TerrainProfileTest < ActiveSupport::TestCase
  test '#touched on add measurement' do
    terrain_profile = TerrainProfile.create!(name: 'Steepest', user: users(:regular_user))
    updated_at = terrain_profile.updated_at

    terrain_profile.measurements.create!(altitude: 30, distance: 0)
    terrain_profile.reload

    assert_not_equal updated_at, terrain_profile.updated_at
  end

  test 'unpublished profile does not require place and track' do
    terrain_profile = TerrainProfile.new(name: 'Backyard', user: users(:regular_user))

    assert_predicate terrain_profile, :valid?
  end

  test 'published profile requires place and track' do
    terrain_profile = TerrainProfile.new(
      name: 'Backyard',
      user: users(:regular_user),
      published: true
    )

    assert_not_predicate terrain_profile, :valid?
    assert_includes terrain_profile.errors.attribute_names, :place
    assert_includes terrain_profile.errors.attribute_names, :track
  end

  test 'published profile requires track recorded at the place' do
    terrain_profile = TerrainProfile.new(
      name: 'Backyard',
      user: users(:regular_user),
      place: places(:loen),
      track: tracks(:hellesylt),
      published: true
    )

    assert_not_predicate terrain_profile, :valid?
    assert_includes terrain_profile.errors.attribute_names, :track_id
  end

  test '#published= toggles publication' do
    terrain_profile = terrain_profiles(:hellesylt_steep)

    terrain_profile.published = false

    assert_not_predicate terrain_profile, :published?

    terrain_profile.published = true

    assert_predicate terrain_profile, :published?
  end

  test '.published returns only published profiles' do
    assert_includes TerrainProfile.published, terrain_profiles(:hellesylt_steep)
    assert_not_includes TerrainProfile.published, terrain_profiles(:own_draft)
  end

  test '#measurements_text renders stored measurements' do
    assert_equal "0 0\n300 500", terrain_profiles(:hellesylt_steep).measurements_text
  end

  test '#measurements_text= replaces measurements on save' do
    terrain_profile = terrain_profiles(:hellesylt_steep)

    terrain_profile.update!(measurements_text: "0 0\n120 90\n\n400,5 610")

    assert_equal [[0, 0], [120, 90], [401, 610]],
                 terrain_profile.reload.measurements.pluck(:altitude, :distance)
  end

  test '#measurements_text= rejects malformed lines' do
    terrain_profile = terrain_profiles(:hellesylt_steep)
    terrain_profile.measurements_text = "0 0\nnot a measurement"

    assert_not_predicate terrain_profile, :valid?
    assert_includes terrain_profile.errors.attribute_names, :measurements_text
    assert_equal 2, terrain_profile.reload.measurements.count
  end

  test '.default_for returns a published profile of the place' do
    assert_equal terrain_profiles(:hellesylt_steep),
                 TerrainProfile.default_for(places(:hellesylt), users(:admin))
  end

  test '.default_for prefers own profile of the place' do
    own = terrain_profiles(:own_draft)
    own.update!(place: places(:hellesylt))
    own.measurements.create!(altitude: 100, distance: 50)

    assert_equal own, TerrainProfile.default_for(places(:hellesylt), users(:regular_user))
  end

  test '.default_for ignores profiles of other users' do
    terrain_profiles(:own_draft).update!(place: places(:hellesylt))

    assert_equal terrain_profiles(:hellesylt_steep),
                 TerrainProfile.default_for(places(:hellesylt), users(:event_responsible))
  end

  test 'places editor can edit published profiles' do
    assert_predicate terrain_profiles(:hellesylt_steep), :published?
    assert terrain_profiles(:hellesylt_steep).editable?(users(:places_editor))
  end

  test 'places editor can edit unpublished shared profiles' do
    shared = TerrainProfile.create!(name: 'Community draft')

    assert_predicate shared, :shared?
    assert shared.editable?(users(:places_editor))
    assert shared.viewable?(users(:places_editor))
  end

  test 'regular user can not see unpublished shared profiles' do
    shared = TerrainProfile.create!(name: 'Community draft')

    assert_not shared.editable?(users(:regular_user))
    assert_not shared.viewable?(users(:regular_user))
    assert_not_includes TerrainProfile.viewable(users(:regular_user)), shared
  end

  test '.viewable includes shared drafts for places editors' do
    shared = TerrainProfile.create!(name: 'Community draft')

    assert_includes TerrainProfile.viewable(users(:places_editor)), shared
  end

  test 'places editor can not edit or see somebody else unpublished profile' do
    own_draft = terrain_profiles(:own_draft)
    editor = users(:places_editor)

    assert_not own_draft.editable?(editor)
    assert_not own_draft.viewable?(editor)
  end

  test 'owner can edit own unpublished profile' do
    assert terrain_profiles(:own_draft).editable?(users(:regular_user))
  end

  test 'admin can edit any profile' do
    assert terrain_profiles(:own_draft).editable?(users(:admin))
  end

  test '#full_name includes place when present' do
    assert_equal 'Hellesylt - Steepest', terrain_profiles(:hellesylt_steep).full_name
    assert_equal 'Backyard cliff', terrain_profiles(:own_draft).full_name
  end
end
