require 'test_helper'

class Tracks::Debriefs::RegenerationsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    @competition = virtual_competitions(:feather_challenge)
    @competition.update_columns(visibility: VirtualCompetition.visibilities[:public_competition])
    @owner = users(:regular_user)
    @track = create_track_from_file('WBR/Yegor_16_Round3.CSV', kind: :base, recorded_at: Time.zone.parse('2025-06-01'),
                                                               pilot: profiles(:regular_user))
    @track.update!(owner: @owner, ff_end: 49)
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track: @track, result: 250)
    virtual_competition_disciplines(:feather_challenge_flare).results.create!(track: @track, result: 23.6)
    discipline = Track::Debrief::Catalog.new(@track, viewer: @owner).find('distance_in_altitude-200+flare-0')
    @debrief = Track::Debrief.request(@track, discipline, strategy: 'opus_agent')
    @debrief.update!(status: :ready, generated_at: Time.current, content: 'Done')
  end

  test 'admin regenerates a debrief with the same strategy even when nothing changed' do
    sign_in users(:admin)

    assert_enqueued_with(job: DebriefJob) do
      post track_debrief_regeneration_path(@track, @debrief)
    end

    fresh = @track.debriefs.latest_first.first
    assert_not_equal @debrief, fresh
    assert_equal 'opus_agent', fresh.strategy
    assert_redirected_to track_debrief_path(@track, fresh)
  end

  test 'the pilot cannot regenerate' do
    sign_in @owner

    assert_no_enqueued_jobs { post track_debrief_regeneration_path(@track, @debrief) }
    assert_response :forbidden
  end
end
