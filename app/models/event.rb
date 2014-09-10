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

  def results
    # TODO: if event.type.eql? Time_Distance_Speed_PL
    process_result query_result
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

  def process_result(query_result)
    # returns structure:
    # -Class (Advanced, Intermediate, Rookie, Tracksuit)
    # --Competitor
    # --Time
    # ---Round
    # ---Result
    # ---%}
    # --Distance
    # ---Round
    # ---Result
    # ---%}
    # --Speed
    # ---Round
    # ---Result
    # ---%}
    # --Total, %

    results_by_class = {:advanced => [], :intermediate => []}
    results_by_class[:rookie] = []
    results_by_class[:tracksuit] = []

    self.competitors.each do |x|
        results_by_class[x.wingsuit.ws_class.name.downcase.to_sym] << {:competitor => {:id => x.id, :name => x.user.name, :wingsuit => x.wingsuit.name},
                                                              :time => [], :distance => [], :speed => [], :total => nil}
    end

    if self.merge_intermediate_and_rookie
      results_by_class[:intermediate] += results_by_class[:rookie]
      results_by_class.delete :rookie
    end

    time_rounds.each do |x|
      results_by_class.each do |key, klass|
        klass.each do |competitor|
          competitor[:time] << {:id => x.id, :name => x.name, :result => nil}
        end
      end
    end

    distance_rounds.each do |x|
      results_by_class.each do |key, klass|
        klass.each do |competitor|
          competitor[:distance] << {:id => x.id, :name => x.name, :result => nil}
        end
      end
    end

    speed_rounds.each do |x|
      results_by_class.each do |key, klass|
        klass.each do |competitor|
          competitor[:speed] << {:id => x.id, :name => x.name, :result => nil}
        end
      end
    end

    results_by_class.each do |key, klass|
      klass.each do |competitor|
        competitor[:time] << {:id => 'Total', :name => 'Total', :result => nil}
        competitor[:distance] << {:id => 'Total', :name => 'Total', :result => nil}
        competitor[:speed] << {:id => 'Total', :name => 'Total', :result => nil}
      end
    end

    self.event_tracks.each do |x|

    end

    #query_result.to_a.map(&:serializable_hash)

    results_by_class
  end

  def rounds_by_discipline(discipline)
    self.rounds.where(:discipline => discipline).order(:name)
  end

end
