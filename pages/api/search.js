      // 성공 응답 - 201 Created + Location 헤더
      logger.info('DISCUSSION_CREATED', {
        reqId,
        route: '/api/search',
        method: 'POST',
        durationMs: Date.now() - startTime,
        status: 201,
        discussionId,
        queryLength: query.length
      });

      res.setHeader('Location', `/discussion?id=${discussionId}`);
      res.status(201).json({ 
        discussionId,
        message: 'Discussion created successfully' 
      });