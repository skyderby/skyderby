module FlightProfilesScoped
  extend ActiveSupport::Concern

  included do
    before_action :load_scope
  end

  def scope_tracks
    @scope.tracks.includes(:pilot, suit: [:manufacturer]).base.accessible_by(current_user)
  end

  def load_scope
    @scope = scope_class.find(params["#{scope_class.name.underscore}_id"])
  end

  def scope_class
    [Profile, VirtualCompetition, Place].detect { |c| params["#{c.name.underscore}_id"] }
  end
end
