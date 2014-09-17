class Event < ActiveRecord::Base
  has_many :event_tracks, through: :rounds
  has_many :users, through: :competitors
  has_many :organizers
  has_many :competitors
  has_many :rounds
  has_many :participation_forms
  has_many :invitations
  has_many :event_documents

  scope :coming, lambda { where('DATE(end_at) > ?', Date.today)}
  scope :completed, lambda { where('DATE(end_at) < ?', Date.today)}

  Results_struct = Struct.new(:ws_class, :usage, :competitors)
  Competitor_struct = Struct.new(:name, :id, :user_id, :wingsuit, :time,
                                 :time_points, :distance, :distance_points,
                                 :speed, :speed_points, :total)

  def results
    # TODO: if event.type.eql? Time_Distance_Speed_PL
    process_results
  end

  # @return [Array]
  def competitors_table

    advanced_comps = Results_struct.new(:advanced, true, [])
    intermediate_comps = Results_struct.new(:intermediate, true, [])
    rookie_comps = Results_struct.new(:rookie, !self.merge_intermediate_and_rookie, [])
    tracksuit_comps = Results_struct.new(:tracksuit, self.allow_tracksuits, [])

    self.competitors.each do |comp|

      comp_el = Competitor_struct.new(comp.user.name, comp.id, comp.user.id, comp.wingsuit.name, [], nil, [], nil, [], nil, nil)

      if ws_class(comp) == :advanced
        advanced_comps.competitors << comp_el
      elsif ws_class(comp) == :intermediate
        intermediate_comps.competitors << comp_el
      elsif ws_class(comp) == :rookie
        if rookie_comps.usage
          rookie_comps.competitors << comp_el
        else
          intermediate_comps.competitors << comp_el
        end
      elsif ws_class(comp) == :tracksuit && tracksuit_comps.usage
        tracksuit_comps.competitors << comp_el
      end

    end

    results_ary = []
    results_ary << advanced_comps
    results_ary << intermediate_comps
    results_ary << rookie_comps if rookie_comps.usage
    results_ary << tracksuit_comps if tracksuit_comps.usage

    results_ary

  end

  # TODO scopes for rounds
  def time_rounds
    rounds_by_discipline Discipline.time
  end

  def distance_rounds
    rounds_by_discipline Discipline.distance
  end

  def speed_rounds
    rounds_by_discipline Discipline.speed
  end

  private

  # returns active-record relation
  def query_result
    Competitor.where(:event_id => self.id)
                .joins('LEFT OUTER JOIN rounds ON rounds.event_id = competitors.event_id')
                .joins('LEFT OUTER JOIN wingsuits ON wingsuits.id = competitors.wingsuit_id')
                .joins('LEFT OUTER JOIN ws_classes ON ws_classes.id = wingsuits.ws_class_id')
                .joins('LEFT OUTER JOIN event_tracks ON event_tracks.competitor_id = competitors.id AND round_id = rounds.id')
                .select('competitors.*, rounds.*, event_tracks.*, ws_classes.name ws_class')
  end

  def process_results
    # returns structure:
    # -Class (Advanced, Intermediate, Rookie, Tracksuit)
    # --Competitor
    # ---Time
    # ----Round
    # ----Result
    # ----%}
    # ---Distance
    # ----Round
    # ----Result
    # ----%}
    # ---Speed
    # ----Round
    # ----Result
    # ----%}
    # ---Total, %

    advanced_comps = Results_struct.new(:advanced, true, [])
    intermediate_comps = Results_struct.new(:intermediate, true, [])
    rookie_comps = Results_struct.new(:rookie, !self.merge_intermediate_and_rookie, [])
    tracksuit_comps = Results_struct.new(:tracksuit, self.allow_tracksuits, [])

    self.competitors.each do |comp|

      comp_el = Competitor_struct.new(comp.user.name, comp.id, comp.user.id, comp.wingsuit.name, [], nil, [], nil, [], nil, nil)

      comp.event_tracks.each do |ev_track|
        if ev_track.round.discipline == Discipline.time
          comp_el.time << {:id => ev_track.round.id, :result => ev_track.result, :points => 0}
        elsif ev_track.round.discipline == Discipline.distance
          comp_el.distance << {:id => ev_track.round.id, :result => ev_track.result, :points => 0}
        elsif ev_track.round.discipline == Discipline.speed
          comp_el.speed << {:id => ev_track.round.id, :result => ev_track.result, :points => 0}
        end
      end
      comp_el.total = 0

      if ws_class(comp) == :advanced
        advanced_comps.competitors << comp_el
      elsif ws_class(comp) == :intermediate
        intermediate_comps.competitors << comp_el
      elsif ws_class(comp) == :rookie
        if rookie_comps.usage
          rookie_comps.competitors << comp_el
        else
          intermediate_comps.competitors << comp_el
        end
      elsif ws_class(comp) == :tracksuit && tracksuit_comps.usage
        tracksuit_comps.competitors << comp_el
      end

    end

    # total calc and sorting
    # time_rounds.each do |r|
    #   max_val = advanced_comps.competitors.max_by { |x| }
    # end

    results_ary = []
    results_ary << advanced_comps
    results_ary << intermediate_comps
    results_ary << rookie_comps if rookie_comps.usage
    results_ary << tracksuit_comps if tracksuit_comps.usage

    results_ary

    # self.event_tracks.each do |x|
    #   flat_results << {:class => ws_class(x.competitor), :competitor => x.competitor,
    #                        :discipline => x.round.discipline, :round => x.round, :result => x.result}
    # end
    #
    # results_by_class = {:advanced => [], :intermediate => []}
    # results_by_class[:rookie] = []
    # results_by_class[:tracksuit] = []
    #
    # self.competitors.each do |x|
    #     results_by_class[ws_class x] << {:competitor => {:id => x.id, :name => x.user.name, :wingsuit => x.wingsuit.name},
    #                                                           :time => [], :distance => [], :speed => [], :total => nil}
    # end
    #
    # time_rounds.each do |x|
    #   results_by_class.each do |key, klass|
    #     klass.each do |competitor|
    #       competitor[:time] << {:id => x.id, :name => x.name, :result => nil}
    #     end
    #   end
    # end
    #
    # distance_rounds.each do |x|
    #   results_by_class.each do |key, klass|
    #     klass.each do |competitor|
    #       competitor[:distance] << {:id => x.id, :name => x.name, :result => nil}
    #     end
    #   end
    # end
    #
    # speed_rounds.each do |x|
    #   results_by_class.each do |key, klass|
    #     klass.each do |competitor|
    #       competitor[:speed] << {:id => x.id, :name => x.name, :result => nil}
    #     end
    #   end
    # end
    #
    # results_by_class.each do |key, klass|
    #   klass.each do |competitor|
    #     competitor[:time] << {:id => 'Total', :name => 'Total', :result => nil}
    #     competitor[:distance] << {:id => 'Total', :name => 'Total', :result => nil}
    #     competitor[:speed] << {:id => 'Total', :name => 'Total', :result => nil}
    #   end
    # end
    #
    # if self.merge_intermediate_and_rookie
    #   results_by_class[:intermediate] += results_by_class[:rookie]
    #   results_by_class.delete :rookie
    # end
    #
    # #query_result.to_a.map(&:serializable_hash)
    #
    # results_by_class
  end

  def ws_class(competitor)
    competitor.wingsuit.ws_class.name.downcase.to_sym
  end

  def rounds_by_discipline(discipline)
    self.rounds.where(:discipline => discipline).order(:name)
  end

end
