class Track::Debrief::Investigation
  MAX_TURNS = 14
  MAX_TOKENS = 16_000
  ADVISOR_BETA = 'advisor-tool-2026-03-01'.freeze
  USAGE_KEYS = %i[input_tokens output_tokens cache_read_input_tokens cache_creation_input_tokens].freeze
  Result = Data.define(:text, :model, :usage, :evidence, :refused)

  attr_reader :debrief, :client, :model, :advisor

  def usage = @usage.dup

  def initialize(debrief, client:, model:, advisor: nil)
    @debrief = debrief
    @client = client
    @model = model
    @advisor = advisor
    @usage = Hash.new(0)
  end

  def run
    messages = [{ role: 'user', content: Track::Debrief::Prompt.new(debrief).agent_message }]
    message = nil

    MAX_TURNS.times do |turn|
      message = turn!(messages, final: turn == MAX_TURNS - 1)
      return result(message, refused: true) if message.stop_reason == :refusal
      next if message.stop_reason == :pause_turn
      break unless message.stop_reason == :tool_use

      messages << { role: 'user', content: tool_results(message) }
    end

    result(message, refused: false)
  end

  def turn!(messages, final:)
    message = client.beta.messages.create(**request(messages, final:))
    add_usage(message.usage)
    messages << { role: 'assistant', content: message.content.map { |block| JSON.parse(block.to_json) } }
    message
  end

  private

  def toolbox = @toolbox ||= Track::Debrief::Toolbox.new(debrief)

  def request(messages, final:)
    {
      model:,
      max_tokens: MAX_TOKENS,
      system_: [{ type: 'text', text: system_prompt, cache_control: { type: 'ephemeral' } }],
      messages:,
      tools: tools,
      tool_choice: final ? { type: 'none' } : { type: 'auto' },
      cache_control: { type: 'ephemeral' },
      output_config: { effort: :high },
      fallbacks: :default,
      betas: [Track::Debrief::Generation::FALLBACK_BETA, (ADVISOR_BETA if advisor)].compact
    }
  end

  def system_prompt = Track::Debrief::Prompt.new(debrief).agent_system(advisor: advisor.present?)

  def tools
    definitions = toolbox.definitions.map(&:dup)
    advisor ? definitions + [{ type: 'advisor_20260301', name: 'advisor', model: advisor, max_uses: 2 }] : definitions
  end

  def tool_results(message)
    message.content.select { |block| block.type == :tool_use }.map do |block|
      { type: 'tool_result', tool_use_id: block.id, content: JSON.generate(toolbox.call(block.name, block.input)) }
    end
  end

  def add_usage(usage)
    USAGE_KEYS.each { |key| @usage[key.to_s] += usage.public_send(key).to_i }
    usage.iterations.to_a.select { |iteration| iteration.type == :advisor_message }.each do |iteration|
      USAGE_KEYS.each { |key| @usage["advisor_#{key}"] += iteration.public_send(key).to_i }
    end
    @usage['requests'] += 1
  end

  def result(message, refused:)
    text = message.content.select { |block| block.type == :text }.map(&:text).join("\n\n")
    Result.new(text:, model: message.model.to_s, usage: @usage.merge('stop_reason' => message.stop_reason.to_s),
               evidence: toolbox.evidence, refused:)
  end
end
