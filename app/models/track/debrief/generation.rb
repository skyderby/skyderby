module Track::Debrief::Generation
  extend ActiveSupport::Concern

  OPUS = 'claude-opus-5-5'.freeze
  SONNET = 'claude-sonnet-5-5'.freeze
  MODEL = OPUS
  MAX_TOKENS = 16_000
  FALLBACK_BETA = 'server-side-fallback-2026-07-01'.freeze
  STRATEGIES = {
    'opus_single' => { model: OPUS },
    'sonnet_agent' => { model: SONNET },
    'sonnet_agent_advisor' => { model: SONNET, advisor: OPUS },
    'opus_agent' => { model: OPUS },
    'comparison' => { model: OPUS, single: true }
  }.freeze

  included do
    validates :strategy, inclusion: { in: STRATEGIES.keys }
  end

  class_methods do
    def anthropic_client
      api_key = Rails.application.credentials.dig(:anthropic, :api_key) || ENV.fetch('ANTHROPIC_API_KEY', nil)
      api_key ? Anthropic::Client.new(api_key:) : Anthropic::Client.new
    end
  end

  def agent? = strategy != 'opus_single' && !STRATEGIES.dig(strategy, :single)

  def generate!(client: self.class.anthropic_client)
    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    agent? ? investigate(client) : write_in_one_request(client)
  rescue Anthropic::Errors::APIError => e
    fail_with("#{e.class.name}: #{e.message}", usage: @investigation&.usage)
  ensure
    record_generation(Process.clock_gettime(Process::CLOCK_MONOTONIC) - started)
  end

  private

  def write_in_one_request(client)
    message = client.beta.messages.create(**request_params)
    usage = message.usage.to_h
    model = message.model.to_s
    return fail_with("refused: #{message.stop_details&.category}", usage:, model:) if message.stop_reason == :refusal
    return fail_with('truncated: max_tokens', usage:, model:) if message.stop_reason == :max_tokens

    finish(text: message.content.select { |block| block.type == :text }.map(&:text).join("\n\n"), model:, usage:)
  end

  def investigate(client)
    config = STRATEGIES.fetch(strategy)
    @investigation = Track::Debrief::Investigation.new(self, client:, model: config[:model], advisor: config[:advisor])
    result = @investigation.run
    return fail_with('refused', usage: result.usage, model: result.model) if result.refused
    return fail_with('no text', usage: result.usage, model: result.model) if result.text.blank?

    finish(text: result.text, model: result.model, usage: result.usage, evidence: result.evidence)
  end

  def finish(text:, model:, usage:, evidence: {})
    update!(status: :ready, content: text, model:, evidence: evidence.presence || self.evidence,
            prompt_version: Track::Debrief::Prompt::VERSION,
            usage: usage.to_h.deep_stringify_keys, generated_at: Time.current, error: nil)
  end

  def fail_with(error, usage: nil, model: nil)
    update!(status: :failed, error:, usage: usage.presence&.to_h&.deep_stringify_keys || self.usage,
            model: model.presence || self.model || STRATEGIES.dig(strategy, :model))
  end

  def record_generation(seconds)
    return unless persisted?

    update!(generation_seconds: seconds.round(1), cost_usd: estimate_cost&.round(5))
  end

  def prompt = comparison? ? Track::Debrief::ComparisonPrompt.new(self) : Track::Debrief::Prompt.new(self)

  def request_params
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system_: [{ type: 'text', text: prompt.system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt.user_message }],
      output_config: { effort: :high },
      fallbacks: :default,
      betas: [FALLBACK_BETA]
    }
  end
end
