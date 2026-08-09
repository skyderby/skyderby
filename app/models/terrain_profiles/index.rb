module TerrainProfiles
  class Index
    attr_reader :user

    def initialize(user:)
      @user = user
    end

    def published
      @published ||= TerrainProfile.viewable(user).publicly_listed.alphabetically.to_a
    end

    def own
      @own ||= own? ? TerrainProfile.owned_by(user).alphabetically.to_a : []
    end

    def own?
      user&.registered? || false
    end
  end
end
