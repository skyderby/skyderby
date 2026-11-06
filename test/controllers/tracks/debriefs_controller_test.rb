require 'test_helper'

class Tracks::DebriefsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  KEY = 'distance_in_altitude-200+flare-0'.freeze

  setup do
    @competition = virtual_competitions(:feather_challenge)
    @competition.update_columns(visibility: VirtualCompetition.visibilities[:public_competition])
    @owner = users(:regular_user)
    @track = create_track_from_file('WBR/Yegor_16_Round3.CSV', kind: :base, recorded_at: Time.zone.parse('2025-06-01'),
                                                               pilot: profiles(:regular_user))
    @track.update!(owner: @owner, ff_end: 49)
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track: @track, result: 250)
    virtual_competition_disciplines(:feather_challenge_flare).results.create!(track: @track, result: 23.6)
  end

  test 'only admins can list and request debriefs while they are in preview' do
    sign_in @owner
    get track_debriefs_path(@track)
    assert_response :forbidden

    post track_debriefs_path(@track), params: { discipline_key: KEY }
    assert_response :forbidden

    sign_in users(:admin)
    get track_debriefs_path(@track)
    assert_response :success
  end

  test 'anyone with the link can read a debrief of a public jump, only the pilot and admins a private one' do
    debrief = ready_debrief

    get track_debrief_path(@track, debrief)
    assert_response :success
    assert_select '.debrief-feedback', 0
    assert_select '.debrief-page__back', 0

    @track.update!(visibility: :private_track)
    sign_in users(:event_responsible)
    get track_debrief_path(@track, debrief)
    assert_response :forbidden

    sign_in @owner
    get track_debrief_path(@track, debrief)
    assert_response :success
    assert_select '.debrief-feedback'
  end

  test 'lists disciplines of active rankings to debrief' do
    sign_in users(:admin)

    get track_debriefs_path(@track)

    assert_select 'select[name=discipline_key] option[value=?]', KEY
    assert_select '.page-tab-active', text: /Debriefs/
  end

  test 'requests a debrief for the chosen discipline and shows it pending' do
    sign_in users(:admin)

    assert_enqueued_with(job: DebriefJob) { post track_debriefs_path(@track), params: { discipline_key: KEY } }
    follow_redirect!

    assert_response :success
    assert_select '.debrief-report__status[role=status]'
  end

  test 'rejects disciplines outside the catalog' do
    sign_in users(:admin)

    post track_debriefs_path(@track), params: { discipline_key: 'flare-0' }

    assert_response :unprocessable_content
  end

  test 'renders a ready debrief with metrics and charts' do
    sign_in @owner
    debrief = ready_debrief

    get track_debrief_path(@track, debrief)

    assert_select '.debrief-report__body h2', 'Flare'
    assert_select '.debrief-metric', /m\z/
    assert_select '.debrief-chart[data-controller=?]', 'tracks--debrief-chart'
  end

  test 'shows the regenerate button only to admins' do
    debrief = ready_debrief

    sign_in @owner
    get track_debrief_path(@track, debrief)
    assert_select '.debrief-page__admin', 0

    sign_in users(:admin)
    get track_debrief_path(@track, debrief)
    assert_select '.debrief-page__admin form[action=?]', track_debrief_regeneration_path(@track, debrief)
  end

  test 'is available for wingsuit skydives but not for other suits' do
    sign_in users(:admin)

    @track.update!(kind: :skydive)
    get track_debriefs_path(@track)
    assert_response :success

    @track.update!(suit: suits(:oneshot))
    get track_debriefs_path(@track)
    assert_response :not_found
  end

  private

  def ready_debrief
    discipline = Track::Debrief::Catalog.new(@track, viewer: @owner).find(KEY)
    Track::Debrief.request(@track, discipline, user: @owner).tap do |debrief|
      debrief.update!(status: :ready, generated_at: Time.current,
                      content: "## Flare\n\nYou gained <metric key=\"flare.gain\"/>.\n\n<chart name=\"flare_gain\"/>")
    end
  end
end
