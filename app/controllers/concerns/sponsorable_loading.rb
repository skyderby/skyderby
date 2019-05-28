module SponsorableLoading
  extend ActiveSupport::Concern

  included do
    before_action :load_sponsorable
    before_action :authorize_sponsorable
  end

  def load_sponsorable
    @sponsorable = sponsorable_class.find(params["#{sponsorable_class.name.underscore}_id"])
  end

  def sponsorable_class
    [Event, Tournament, VirtualCompetition].detect { |c| params["#{c.name.underscore}_id"] }
  end

  def authorize_sponsorable
    return if policy(@sponsorable).update?

    raise Pundit::NotAuthorizedError
  end
end
