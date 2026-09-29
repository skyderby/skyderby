module Api
  module TournamentScoped
    extend ActiveSupport::Concern

    included do
      before_action :set_tournament
    end

    private

    def set_tournament
      @tournament = Tournament.includes(place: :country).find(params[:tournament_id])
      raise ActiveRecord::RecordNotFound unless @tournament.viewable?
    end

    def change_marker(relation)
      table = relation.klass.quoted_table_name
      relation.unscope(:order).pick(Arel.sql("MAX(#{table}.updated_at)"), Arel.sql("COUNT(#{table}.id)"))
    end
  end
end
