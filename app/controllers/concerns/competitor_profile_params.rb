module CompetitorProfileParams
  extend ActiveSupport::Concern

  private

  def resolve_profile(permitted)
    return permitted.except(:profile_id, :alias_id) if editing_event_profile?
    return permitted.except(:profile_attributes) if permitted[:profile_id].present?

    resolved = Profile.resolve_name(permitted.dig(:profile_attributes, :name))
    return permitted.except(:profile_id, :alias_id) unless resolved

    profile_id, alias_id = resolved
    permitted.except(:profile_attributes).merge(profile_id:, alias_id:)
  end

  def editing_event_profile?
    @competitor&.persisted? && @competitor.profile&.owner == @event
  end
end
