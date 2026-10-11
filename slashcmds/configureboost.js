description',
              label: 'Embed Description (with {user}, {guild}, {boostcount})',
              style: 2,
              required: true,
              placeholder: 'Thanks {user} for boosting {guild}!',
            }
          ]
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'footer',
              label: 'Footer (optional)',
              style: 1,
              required: false,
              placeholder: 'Boosted by a legend 💫',
            }
          ]
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'color',
              label: 'Hex Color (optional)',
              style: 1,
              required: false,
              placeholder: '#FF73FA',
            }
          ]
        }
      ]
    });
  }
};
