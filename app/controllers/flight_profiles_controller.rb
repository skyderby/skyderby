class FlightProfilesController < ApplicationController
  before_action :load_scope

  def show
    authorize @scope
    fresh_when etags_for(@scope)
  end

  def load_scope
    @scope = scope_class.find(params["#{scope_class.name.underscore}_id"])
  end

  def scope_class
    [Profile, VirtualCompetition, Place].detect { |c| params["#{c.name.underscore}_id"] }
  end
end
