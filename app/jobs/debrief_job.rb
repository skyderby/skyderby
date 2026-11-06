class DebriefJob < ApplicationJob
  def perform(debrief_id)
    debrief = Track::Debrief.find_by(id: debrief_id)
    return unless debrief&.pending?

    generate(debrief)
    broadcast(debrief)
  end

  private

  def generate(debrief)
    debrief.generate!
  rescue StandardError => e
    debrief.update!(status: :failed, error: "#{e.class.name}: #{e.message}")
    broadcast(debrief)
    raise
  end

  def broadcast(debrief)
    I18n.with_locale(debrief.locale) do
      Turbo::StreamsChannel.broadcast_replace_to debrief, target: ActionView::RecordIdentifier.dom_id(debrief),
                                                          partial: 'tracks/debriefs/report',
                                                          locals: { debrief: }
    end
  end
end
