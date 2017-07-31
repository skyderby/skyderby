module VirtualCompetitions
  class TitlePresenter
    def self.call(competition)
      new(competition).call
    end

    def initialize(competition)
      @competition = competition
    end

    def call
      group_name = competition.group ? competition.group.name + ' - ' : ''
      group_name + competition.name
    end

    private

    attr_reader :competition
  end
end
