class ProfileFacade < SimpleDelegator
  def initialize(params, current_user)
    @params = params
    @current_user = current_user

    super(profile)
  end

  def name
    profile.name.presence || 'Name not set'
  end

  def tracks
    @tracks ||= profile.tracks.accessible_by(current_user)
  end

  def max_distance
    DistanceFormatter.new.call(best_result(:distance))
  end

  def max_speed
    SpeedFormatter.new.call(best_result(:speed))
  end

  def max_time
    TimeFormatter.new.call(best_result(:time))
  end

  private

  attr_reader :params, :current_user

  def best_result(task)
    all_results(task).max_by { |result| valid_result(result) || 0 }
  end

  def all_results(task)
    return [NullResult.new.result] if tracks.blank?
    tracks.map { |track| (track.public_send(task) || NullResult.new).result }
  end

  def valid_result(result)
    return nil if result.nan?

    result
  end

  def profile
    @profile ||= Profile.includes(
      :badges,
      { personal_top_scores: :virtual_competition },
      tracks: [
        :distance,
        :speed,
        :time,
        :video,
        { suit: :manufacturer },
        { place: :country }
      ]
    ).find(params[:id])
  end

  class NullResult
    def result
      0.0
    end
  end

  class DistanceFormatter
    def call(value)
      value.zero? ? '----' : value.round
    end
  end

  class SpeedFormatter
    def call(value)
      value.zero? ? '---' : value.round
    end
  end

  class TimeFormatter
    def call(value)
      value.zero? ? '--.-' : value.round(1)
    end
  end
end
