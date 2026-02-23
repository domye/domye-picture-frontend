declare namespace API {
  type addSpaceParams = {
    spaceAddRequest: SpaceAddRequest
  }

  type AiChatRequest = {
    message?: string
  }

  type BaseResponseBoolean = {
    code?: number
    data?: boolean
    message?: string
  }

  type BaseResponseListMapStringObject = {
    code?: number
    data?: Record<string, any>[]
    message?: string
  }

  type BaseResponseListPictureVO = {
    code?: number
    data?: PictureVO[]
    message?: string
  }

  type BaseResponseListSpace = {
    code?: number
    data?: Space[]
    message?: string
  }

  type BaseResponseListSpaceCategoryAnalyzeResponse = {
    code?: number
    data?: SpaceCategoryAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceLevel = {
    code?: number
    data?: SpaceLevel[]
    message?: string
  }

  type BaseResponseListSpaceSizeAnalyzeResponse = {
    code?: number
    data?: SpaceSizeAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceTagAnalyzeResponse = {
    code?: number
    data?: SpaceTagAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceUserAnalyzeResponse = {
    code?: number
    data?: SpaceUserAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceUserVO = {
    code?: number
    data?: SpaceUserVO[]
    message?: string
  }

  type BaseResponseListUserActiveRankItemVO = {
    code?: number
    data?: UserActiveRankItemVO[]
    message?: string
  }

  type BaseResponseListUserVO = {
    code?: number
    data?: UserVO[]
    message?: string
  }

  type BaseResponseLoginUserVO = {
    code?: number
    data?: LoginUserVO
    message?: string
  }

  type BaseResponseLong = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponseObject = {
    code?: number
    data?: Record<string, any>
    message?: string
  }

  type BaseResponsePageCommentListVO = {
    code?: number
    data?: PageCommentListVO
    message?: string
  }

  type BaseResponsePageContactVO = {
    code?: number
    data?: PageContactVO
    message?: string
  }

  type BaseResponsePagePicture = {
    code?: number
    data?: PagePicture
    message?: string
  }

  type BaseResponsePagePictureVO = {
    code?: number
    data?: PagePictureVO
    message?: string
  }

  type BaseResponsePageSpace = {
    code?: number
    data?: PageSpace
    message?: string
  }

  type BaseResponsePageSpaceVO = {
    code?: number
    data?: PageSpaceVO
    message?: string
  }

  type BaseResponsePageUserVO = {
    code?: number
    data?: PageUserVO
    message?: string
  }

  type BaseResponsePageVoteActivity = {
    code?: number
    data?: PageVoteActivity
    message?: string
  }

  type BaseResponsePageVoteActivityVO = {
    code?: number
    data?: PageVoteActivityVO
    message?: string
  }

  type BaseResponsePicture = {
    code?: number
    data?: Picture
    message?: string
  }

  type BaseResponsePictureTagCategory = {
    code?: number
    data?: PictureTagCategory
    message?: string
  }

  type BaseResponsePictureVO = {
    code?: number
    data?: PictureVO
    message?: string
  }

  type BaseResponseSpace = {
    code?: number
    data?: Space
    message?: string
  }

  type BaseResponseSpaceUsageAnalyzeResponse = {
    code?: number
    data?: SpaceUsageAnalyzeResponse
    message?: string
  }

  type BaseResponseSpaceUser = {
    code?: number
    data?: SpaceUser
    message?: string
  }

  type BaseResponseSpaceVO = {
    code?: number
    data?: SpaceVO
    message?: string
  }

  type BaseResponseString = {
    code?: number
    data?: string
    message?: string
  }

  type BaseResponseUser = {
    code?: number
    data?: User
    message?: string
  }

  type BaseResponseUserVO = {
    code?: number
    data?: UserVO
    message?: string
  }

  type BaseResponseVoteActivityDetailVO = {
    code?: number
    data?: VoteActivityDetailVO
    message?: string
  }

  type CommentAddRequest = {
    pictureid?: number
    parentid?: number
    content?: string
  }

  type CommentListVO = {
    commentId?: number
    userId?: number
    userName?: string
    userAvatar?: string
    content?: string
    replyCount?: number
    createTime?: string
    replyPreviewList?: CommentReplyVO[]
    mentionedUsers?: CommentMentionVO[]
  }

  type CommentMentionVO = {
    id?: number
    commentId?: number
    mentionedUserId?: number
    mentionedUserName?: string
    mentionedUserAvatar?: string
    isRead?: number
    createTime?: string
  }

  type CommentQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    pictureId?: number
    previewSize?: number
  }

  type CommentReplyQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    pictureId?: number
    commentId?: number
  }

  type CommentReplyVO = {
    commentId?: number
    userId?: number
    userName?: string
    userAvatar?: string
    content?: string
    parentId?: number
    parentUserName?: string
    createTime?: string
    mentionedUsers?: CommentMentionVO[]
  }

  type ContactAddRequest = {
    contactUserId?: number
  }

  type ContactHandleRequest = {
    id?: number
    status?: string
  }

  type ContactQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    status?: number
  }

  type ContactVO = {
    id?: number
    userId?: number
    contactUserId?: number
    status?: number
    createTime?: string
    contactUser?: UserVO
  }

  type DeleteRequest = {
    id?: number
  }

  type FilterListRequest = {
    userId?: number
    type?: number
    mode?: number
  }

  type getFilterListParams = {
    request: FilterListRequest
  }

  type getPictureByIdParams = {
    id: number
  }

  type getPictureVOByIdParams = {
    id: number
  }

  type getSpaceByIdParams = {
    id: number
  }

  type getSpaceVOByIdParams = {
    id: number
  }

  type getUserActivityScoreParams = {
    userActivityScoreQueryRequest: UserActivityScoreQueryRequest
  }

  type getUserByIdParams = {
    id: number
  }

  type getUserVOByIdParams = {
    id: number
  }

  type getVoteActivitiesParams = {
    id: number
  }

  type listReplyCommentsParams = {
    request: CommentReplyQueryRequest
  }

  type listTopCommentsParams = {
    request: CommentQueryRequest
  }

  type LoginUserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    editTime?: string
    createTime?: string
    updateTime?: string
  }

  type OrderItem = {
    column?: string
    asc?: boolean
  }

  type PageCommentListVO = {
    records?: CommentListVO[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageCommentListVO
    searchCount?: PageCommentListVO
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageContactVO = {
    records?: ContactVO[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageContactVO
    searchCount?: PageContactVO
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PagePicture = {
    records?: Picture[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PagePicture
    searchCount?: PagePicture
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PagePictureVO = {
    records?: PictureVO[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PagePictureVO
    searchCount?: PagePictureVO
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageSpace = {
    records?: Space[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageSpace
    searchCount?: PageSpace
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageSpaceVO = {
    records?: SpaceVO[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageSpaceVO
    searchCount?: PageSpaceVO
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageUserVO = {
    records?: UserVO[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageUserVO
    searchCount?: PageUserVO
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageVoteActivity = {
    records?: VoteActivity[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageVoteActivity
    searchCount?: PageVoteActivity
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type PageVoteActivityVO = {
    records?: VoteActivityVO[]
    total?: number
    size?: number
    current?: number
    orders?: OrderItem[]
    optimizeCountSql?: PageVoteActivityVO
    searchCount?: PageVoteActivityVO
    optimizeJoinOfCountSql?: boolean
    maxLimit?: number
    countId?: string
    pages?: number
  }

  type Picture = {
    id?: number
    url?: string
    name?: string
    introduction?: string
    category?: string
    tags?: string
    picSize?: number
    picWidth?: number
    picHeight?: number
    picColor?: string
    picScale?: number
    picFormat?: string
    thumbnailUrl?: string
    reviewStatus?: number
    reviewMessage?: string
    reviewerId?: number
    reviewTime?: string
    userId?: number
    createTime?: string
    editTime?: string
    updateTime?: string
    isDelete?: number
    spaceId?: number
  }

  type PictureEditRequest = {
    id?: number
    name?: string
    introduction?: string
    category?: string
    tags?: string[]
  }

  type PictureQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    name?: string
    introduction?: string
    category?: string
    tags?: string[]
    picSize?: number
    picWidth?: number
    picHeight?: number
    picScale?: number
    picFormat?: string
    searchText?: string
    userId?: number
    reviewStatus?: number
    reviewMessage?: string
    reviewerId?: number
    startEditTime?: string
    endEditTime?: string
    spaceId?: number
  }

  type PictureReviewRequest = {
    id?: number
    reviewStatus?: number
    reviewMessage?: string
  }

  type PictureTagCategory = {
    tagList?: string[]
    categoryList?: string[]
  }

  type PictureUpdateRequest = {
    id?: number
    name?: string
    introduction?: string
    category?: string
    tags?: string[]
    spaceId?: number
  }

  type PictureUploadRequest = {
    id?: number
    spaceId?: number
    picColor?: string
  }

  type PictureVO = {
    id?: number
    url?: string
    thumbnailUrl?: string
    name?: string
    introduction?: string
    tags?: string[]
    category?: string
    picSize?: number
    picWidth?: number
    picHeight?: number
    picScale?: number
    picFormat?: string
    picColor?: string
    userId?: number
    spaceId?: number
    createTime?: string
    editTime?: string
    updateTime?: string
    user?: UserVO
    permissionList?: string[]
  }

  type SearchPictureByColorRequest = {
    picColor?: string
    spaceId?: number
  }

  type Space = {
    id?: number
    spaceName?: string
    spaceLevel?: number
    maxSize?: number
    maxCount?: number
    totalSize?: number
    totalCount?: number
    userId?: number
    createTime?: string
    editTime?: string
    updateTime?: string
    spaceType?: number
    isDelete?: number
  }

  type SpaceAddRequest = {
    spaceName?: string
    spaceLevel?: number
    spaceType?: number
  }

  type SpaceCategoryAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
  }

  type SpaceCategoryAnalyzeResponse = {
    category?: string
    count?: number
    totalSize?: number
  }

  type SpaceEditRequest = {
    id?: number
    spaceName?: string
  }

  type SpaceLevel = {
    value?: number
    text?: string
    maxCount?: number
    maxSize?: number
  }

  type SpaceQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    userId?: number
    spaceName?: string
    spaceLevel?: number
    spaceType?: number
  }

  type SpaceRankAnalyzeRequest = {
    topN?: number
  }

  type SpaceSizeAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
  }

  type SpaceSizeAnalyzeResponse = {
    sizeRange?: string
    count?: number
  }

  type SpaceTagAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
  }

  type SpaceTagAnalyzeResponse = {
    tag?: string
    count?: number
  }

  type SpaceUpdateRequest = {
    id?: number
    spaceName?: string
    spaceLevel?: number
    maxSize?: number
    maxCount?: number
  }

  type SpaceUsageAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
  }

  type SpaceUsageAnalyzeResponse = {
    usedSize?: number
    maxSize?: number
    sizeUsageRatio?: number
    usedCount?: number
    maxCount?: number
    countUsageRatio?: number
  }

  type SpaceUser = {
    id?: number
    spaceId?: number
    userId?: number
    spaceRole?: string
    createTime?: string
    updateTime?: string
  }

  type SpaceUserAddRequest = {
    spaceId?: number
    userId?: number
    spaceRole?: string
  }

  type SpaceUserAnalyzeRequest = {
    spaceId?: number
    queryPublic?: boolean
    queryAll?: boolean
    userId?: number
    timeDimension?: string
  }

  type SpaceUserAnalyzeResponse = {
    period?: string
    count?: number
  }

  type SpaceUserEditRequest = {
    id?: number
    spaceRole?: string
  }

  type SpaceUserQueryRequest = {
    id?: number
    spaceId?: number
    userId?: number
    spaceRole?: string
  }

  type SpaceUserVO = {
    id?: number
    spaceId?: number
    userId?: number
    spaceRole?: string
    createTime?: string
    updateTime?: string
    user?: UserVO
    space?: SpaceVO
  }

  type SpaceVO = {
    id?: number
    spaceName?: string
    spaceLevel?: number
    maxSize?: number
    maxCount?: number
    totalSize?: number
    totalCount?: number
    userId?: number
    spaceType?: number
    createTime?: string
    user?: UserVO
    editTime?: string
    updateTime?: string
    permissionList?: string[]
  }

  type uploadPictureParams = {
    pictureUploadRequest: PictureUploadRequest
  }

  type User = {
    id?: number
    userAccount?: string
    userPassword?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    wxOpenId?: string
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type UserActiveRankItemVO = {
    rank?: number
    score?: number
    user?: UserVO
  }

  type UserActivityScoreQueryRequest = {
    value?: number
    size?: number
  }

  type UserLoginRequest = {
    userAccount?: string
    userPassword?: string
  }

  type UserQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    userName?: string
    userAccount?: string
    userProfile?: string
    userRole?: string
  }

  type UserRegisterRequest = {
    userAccount?: string
    userPassword?: string
    checkPassword?: string
  }

  type UserUpdateRequest = {
    id?: number
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
  }

  type VoteActivity = {
    id?: number
    title?: string
    createUser?: number
    description?: string
    startTime?: string
    endTime?: string
    status?: number
    maxVotesPerUser?: number
    totalVotes?: number
    createTime?: string
    updateTime?: string
  }

  type VoteActivityAddRequest = {
    title?: string
    description?: string
    maxVotesPerUser?: number
    options?: VoteOptionAddRequest[]
    startTime?: string
    endTime?: string
  }

  type VoteActivityDeleteRequest = {
    activityId?: number
  }

  type VoteActivityDetailVO = {
    id?: number
    title?: string
    description?: string
    startTime?: string
    endTime?: string
    status?: number
    maxVotesPerUser?: number
    totalVotes?: number
    options?: VoteOptionVO[]
  }

  type VoteActivityQueryRequest = {
    current?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
    id?: number
    title?: string
    createUser?: number
    description?: string
    startTime?: string
    endTime?: string
    status?: number
    searchText?: string
  }

  type VoteActivityVO = {
    id?: number
    title?: string
    createUser?: number
    description?: string
    startTime?: string
    endTime?: string
    status?: number
    maxVotesPerUser?: number
    totalVotes?: number
  }

  type VoteEndRequest = {
    activityId?: number
  }

  type VoteOptionAddRequest = {
    optionText?: string
  }

  type VoteOptionVO = {
    id?: number
    optionText?: string
    voteCount?: number
  }

  type VoteRequest = {
    activityId?: number
    optionId?: number
    userId?: number
  }
}
