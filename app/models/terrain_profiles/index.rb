module TerrainProfiles
  class Index
    attr_reader :user

    def initialize(user:)
      @user = user
    end

    def published
      @published ||=
        TerrainProfile.viewable(user).publicly_listed.includes(:shares).alphabetically.to_a
    end

    def own
      return [] unless own?

      @own ||=
        TerrainProfile
        .owned_by(user)
        .or(TerrainProfile.shared_with(user))
        .includes(:shares)
        .alphabetically
        .to_a
    end

    def own?
      user&.registered? || false
    end
  end
end
