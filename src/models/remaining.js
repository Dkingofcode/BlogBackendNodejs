// const { DataTypes } = require('sequelize');
// const slugify = require('slugify');



// // Comment Model
// const CommentModel = (sequelize) => {
//   const Comment = sequelize.define('Comment', {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     blogId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: 'blogs',
//         key: 'id',
//       },
//     },
//     userId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: 'users',
//         key: 'id',
//       },
//     },
//     parentId: {
//       type: DataTypes.UUID,
//       allowNull: true,
//       references: {
//         model: 'comments',
//         key: 'id',
//       },
//     },
//     isEdited: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },
//   }, {
//     tableName: 'comments',
//     timestamps: true,
//   });

//   return Comment;
// };

// // Like Model
// const LikeModel = (sequelize) => {
//   const Like = sequelize.define('Like', {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     blogId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: 'blogs',
//         key: 'id',
//       },
//     },
//     userId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       references: {
//         model: 'users',
//         key: 'id',
//       },
//     },
//   }, {
//     tableName: 'likes',
//     timestamps: true,
//     indexes: [
//       {
//         unique: true,
//         fields: ['blogId', 'userId'],
//       },
//     ],
//   });

//   return Like;
// };

// module.exports = {
//   Category: CategoryModel,
//   Tag: TagModel,
//   Comment: CommentModel,
//   Like: LikeModel,
// };