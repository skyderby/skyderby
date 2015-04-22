# Выполняет поиск доступных по переданным параметрам онлайн соревнований
# Параметры:
# - activity - обязательный параметр, принимает значения :skydive или :base
# - suit_kind - обязательный параметр, принимает значения :wingsuit или :tracksuit
# - period - обязательный параметр, используется для фильтрации соревнований
#   по периоду действия (вхождение переданной даты в период действия)
# - place_id - если пустое или отсутствует - выбираются только всемирные, если
#   указано то всемирные и с указанием конкретной локации

module OnlineCompsFinder
  SKYDIVE = :skydive
  BASE = :base
  ACTIVITIES = [SKYDIVE, BASE]

  TRACKSUIT = :tracksuit
  WINGSUIT = :wingsuit
  SUITKINDS = [TRACKSUIT, WINGSUIT]

  class OnlineCompsFindProcessing
    def initialize(params)
      @params = params
      validate!
      @place_id = @params[:place_id]
      @period = @params[:period]
    end

    def find
      comps = VirtualCompetition.order(:name)
      comps = comps.skydive if skydive?
      comps = comps.base if base?

      comps = comps.tracksuit if tracksuit?
      comps = comps.wingsuit if wingsuit?

      comps = comps.where('? BETWEEN period_from AND period_to', @period)

      if @place_id
        comps = comps.where('place_id = ? OR place_id IS NULL', @place_id) 
      else
        comps = comps.where('place_id IS NULL', @place_id) 
      end

      comps.to_a
    end

    private

    def validate!
      raise ArgumentError.new('Activity not defined') unless @params[:activity]   
      raise ArgumentError.new('Suit kind not defined') unless @params[:suit_kind]   
      raise ArgumentError.new('Period not defined') unless @params[:period]   

      unless ACTIVITIES.include? @params[:activity]
        raise ArgumentError.new('Invalid activity')
      end

      unless SUITKINDS.include? @params[:suit_kind]
        raise ArgumentError.new('Invalid suit_kind')
      end
    end

    def skydive?
      @params[:activity].eql? SKYDIVE
    end

    def base?
      @params[:activity].eql? BASE
    end

    def tracksuit?
      @params[:suit_kind].eql? TRACKSUIT
    end

    def wingsuit?
      @params[:suit_kind].eql? WINGSUIT
    end
  end

  def self.find(params)
    OnlineCompsFindProcessing.new(params).find
  end
end
