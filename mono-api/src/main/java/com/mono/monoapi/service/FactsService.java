package com.mono.monoapi.service;

import org.springframework.stereotype.Service;

import com.mono.monoapi.repository.FactsRepository;
import com.mono.monoapi.model.Facts;
import com.mono.monoapi.dto.FactsResponse;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FactsService {

    private static final Logger logger = LoggerFactory.getLogger(FactsService.class);

    @Autowired
    private FactsRepository factsRepository;

    public List<FactsResponse> getFact() {

        List<Facts> allFacts = factsRepository.findAll();

        return allFacts.stream().map(fact -> new FactsResponse(fact.getId(), fact.getText()))
                .toList();

    }

}
