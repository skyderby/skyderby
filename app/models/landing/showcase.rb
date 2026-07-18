module Landing
  class Showcase
    KEYS = %w[skydive_pro_view lane_validation speed_pro_view video_replay].freeze
    IMAGES_PATH = 'app/assets/images/landing'.freeze

    def self.cards
      KEYS.map { |key| new(key) }
    end

    attr_reader :key

    def initialize(key)
      @key = key
    end

    def image
      "landing/#{key}.webp"
    end

    def image?
      Rails.root.join(IMAGES_PATH, "#{key}.webp").exist?
    end
  end
end
