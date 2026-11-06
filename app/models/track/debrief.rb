class Track::Debrief < ApplicationRecord
  include Generation

  STALE_AFTER = 15.minutes
  LOCALE = 'en'.freeze

  belongs_to :track, inverse_of: :debriefs
  belongs_to :other_track, class_name: 'Track', optional: true
  belongs_to :user, optional: true

  enum :status, { pending: 0, ready: 1, failed: 2 }
  enum :feedback, { down: -1, up: 1 }, prefix: true

  validates :locale, :discipline_key, :inputs_digest, :fingerprint, presence: true

  scope :latest_first, -> { order(created_at: :desc) }

  def self.available_for?(track) = (track.base? || track.skydive?) && track.wingsuit?

  def self.latest_for(track, discipline_key, user: nil, strategy: 'opus_single')
    where(track:, discipline_key:, user:, locale: LOCALE, strategy:).latest_first.first
  end

  def self.request(track, discipline, user: nil, strategy: 'opus_single', fresh: false)
    inputs = Inputs.new(track, discipline)
    digest = Inputs.digest(inputs.to_h)
    latest = latest_for(track, discipline.key, user:, strategy:)
    return latest if !fresh && latest && !latest.unsuccessful? && latest.inputs_digest == digest

    create!(track:, user:, discipline_key: discipline.key, locale: LOCALE, strategy:, inputs: inputs.to_h,
            inputs_digest: digest, fingerprint: inputs.fingerprint).tap(&:enqueue)
  end

  def self.compare(comparison, user: nil, fresh: false)
    inputs = comparison.inputs
    digest = Inputs.digest(inputs)
    latest = latest_for(comparison.track, comparison.key, user:, strategy: Comparison::STRATEGY)
    return latest if !fresh && latest && !latest.unsuccessful? && latest.inputs_digest == digest

    create!(track: comparison.track, user:, other_track: comparison.other, discipline_key: comparison.key,
            locale: LOCALE, strategy: Comparison::STRATEGY, inputs:, evidence: comparison.evidence,
            inputs_digest: digest, fingerprint: Comparison::STRATEGY).tap(&:enqueue)
  end

  def enqueue = DebriefJob.perform_later(id)

  def comparison? = other_track_id.present?

  def regenerate
    return self.class.request(track, discipline, user:, strategy:, fresh: true) unless comparison?

    self.class.compare(Comparison.from_debrief(self), user:, fresh: true)
  end

  def read_by_pilot? = user.nil? || Tracks::DebriefPage.own?(track, user)

  def stale? = pending? && created_at < STALE_AFTER.ago

  def unsuccessful? = failed? || stale?

  def discipline = @discipline ||= Discipline.from_h(inputs['discipline'])

  PRICES = {
    'claude-opus-5-5' => { input: 4.0, output: 20.0, cache_read: 0.2, cache_write: 5.0 },
    'claude-sonnet-5-5' => { input: 2.0, output: 10.0, cache_read: 0.2, cache_write: 2.5 }
  }.freeze

  USAGE_KEYS = { input: 'input_tokens', output: 'output_tokens', cache_read: 'cache_read_input_tokens',
                 cache_write: 'cache_creation_input_tokens' }.freeze

  def cost = cost_usd&.to_f || estimate_cost

  def estimate_cost
    prices = PRICES[model.to_s] || return
    advisor_prices = PRICES[Generation::OPUS]
    USAGE_KEYS.sum do |kind, key|
      (usage.to_h[key].to_i * prices[kind]) + (usage.to_h["advisor_#{key}"].to_i * advisor_prices[kind])
    end / 1_000_000
  end

  def document = Document.new(self)
end
